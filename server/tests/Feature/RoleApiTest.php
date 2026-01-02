<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Vendor;
use App\Models\Role;

class RoleApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->vendor = Vendor::factory()->create();
        $this->user = User::factory()->create();
        $role = Role::factory()->create([
            'vendor_id' => $this->vendor->id,
            'can_manage_roles_and_permissions' => true,
        ]);
        $this->user->memberships()->create([
            'vendor_id' => $this->vendor->id,
            'role_id' => $role->id,
        ]);

        $this->actingAs($this->user, 'api');
    }

    public function test_can_get_all_roles()
    {
        Role::factory()->count(2)->create(['vendor_id' => $this->vendor->id]); // 2 plus the setup one

        $response = $this->getJson('/api/roles');

        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    public function test_can_create_a_role()
    {
        $roleData = [
            'name' => 'Cashier',
            'vendor_id' => $this->vendor->id,
            'can_use_pos' => true,
        ];

        $response = $this->postJson('/api/roles', $roleData);

        $response->assertStatus(201)
                 ->assertJsonFragment($roleData);

        $this->assertDatabaseHas('roles', $roleData);
    }

    public function test_can_update_a_role()
    {
        $role = Role::factory()->create(['vendor_id' => $this->vendor->id, 'name' => 'Old Name']);

        $updateData = ['name' => 'New Name'];

        $response = $this->putJson("/api/roles/{$role->id}", $updateData);

        $response->assertStatus(200)
                 ->assertJsonFragment($updateData);

        $this->assertDatabaseHas('roles', $updateData);
    }
}
