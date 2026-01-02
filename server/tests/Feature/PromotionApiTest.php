<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Vendor;
use App\Models\Role;
use App\Models\Promotion;
use Carbon\Carbon;

class PromotionApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->vendor = Vendor::factory()->create();
        $this->user = User::factory()->create();
    }

    private function setupUserWithPermissions($permissions)
    {
        $roleData = array_merge(['vendor_id' => $this->vendor->id], $permissions);
        $role = Role::factory()->create($roleData);
        $this->user->memberships()->create([
            'vendor_id' => $this->vendor->id,
            'role_id' => $role->id,
        ]);

        $this->actingAs($this->user, 'api');
    }

    public function test_can_get_all_promotions_with_view_permission()
    {
        $this->setupUserWithPermissions(['can_view_promotions' => true]);
        Promotion::factory()->count(3)->create(['vendor_id' => $this->vendor->id]);

        $response = $this->getJson('/api/promotions');

        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    public function test_can_create_a_promotion_with_manage_permission()
    {
        $this->setupUserWithPermissions(['can_manage_promotions' => true]);
        $promotionData = [
            'name' => 'Summer Sale',
            'discount_type' => 'percentage',
            'discount_value' => 10,
            'applies_to' => 'all_products',
            'start_date' => Carbon::now()->toDateString(),
            'vendor_id' => $this->vendor->id,
        ];

        $response = $this->postJson('/api/promotions', $promotionData);

        $response->assertStatus(201)
                 ->assertJsonFragment(['name' => 'Summer Sale']);
    }

    public function test_cannot_create_a_promotion_without_manage_permission()
    {
        $this->setupUserWithPermissions(['can_manage_promotions' => false]);
        $response = $this->postJson('/api/promotions', []);
        $response->assertStatus(403);
    }
}
