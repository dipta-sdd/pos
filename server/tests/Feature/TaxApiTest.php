<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Vendor;
use App\Models\Role;
use App\Models\Tax;

class TaxApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->vendor = Vendor::factory()->create();
        $this->user = User::factory()->create();
        $role = Role::factory()->create([
            'vendor_id' => $this->vendor->id,
            'can_configure_taxes' => true,
        ]);
        $this->user->memberships()->create([
            'vendor_id' => $this->vendor->id,
            'role_id' => $role->id,
        ]);

        $this->actingAs($this->user, 'api');
    }

    public function test_can_get_all_taxes()
    {
        Tax::factory()->count(3)->create(['vendor_id' => $this->vendor->id]);

        $response = $this->getJson('/api/taxes');

        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    public function test_can_create_a_tax()
    {
        $taxData = [
            'name' => 'VAT',
            'rate_percentage' => 15.00,
            'vendor_id' => $this->vendor->id,
        ];

        $response = $this->postJson('/api/taxes', $taxData);

        $response->assertStatus(201)
                 ->assertJsonFragment($taxData);

        $this->assertDatabaseHas('taxes', $taxData);
    }

    public function test_can_get_a_single_tax()
    {
        $tax = Tax::factory()->create(['vendor_id' => $this->vendor->id]);

        $response = $this->getJson("/api/taxes/{$tax->id}");

        $response->assertStatus(200)
                 ->assertJsonFragment(['name' => $tax->name]);
    }

    public function test_can_update_a_tax()
    {
        $tax = Tax::factory()->create(['vendor_id' => $this->vendor->id]);

        $updateData = ['name' => 'Sales Tax'];

        $response = $this->putJson("/api/taxes/{$tax->id}", $updateData);

        $response->assertStatus(200)
                 ->assertJsonFragment($updateData);

        $this->assertDatabaseHas('taxes', $updateData);
    }

    public function test_can_delete_a_tax()
    {
        $tax = Tax::factory()->create(['vendor_id' => $this->vendor->id]);

        $response = $this->deleteJson("/api/taxes/{$tax->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('taxes', ['id' => $tax->id]);
    }
}
