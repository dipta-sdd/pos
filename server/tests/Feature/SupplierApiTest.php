<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Vendor;
use App\Models\Role;
use App\Models\Supplier;

class SupplierApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->vendor = Vendor::factory()->create();
        $this->user = User::factory()->create();
        $role = Role::factory()->create([
            'vendor_id' => $this->vendor->id,
            'can_manage_suppliers' => true,
        ]);
        $this->user->memberships()->create([
            'vendor_id' => $this->vendor->id,
            'role_id' => $role->id,
        ]);

        $this->actingAs($this->user, 'api');
    }

    public function test_can_get_all_suppliers()
    {
        Supplier::factory()->count(3)->create(['vendor_id' => $this->vendor->id]);

        $response = $this->getJson('/api/suppliers');

        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    public function test_can_create_a_supplier()
    {
        $supplierData = [
            'name' => 'New Supplier',
            'vendor_id' => $this->vendor->id,
        ];

        $response = $this->postJson('/api/suppliers', $supplierData);

        $response->assertStatus(201)
                 ->assertJsonFragment($supplierData);

        $this->assertDatabaseHas('suppliers', $supplierData);
    }

    public function test_can_get_a_single_supplier()
    {
        $supplier = Supplier::factory()->create(['vendor_id' => $this->vendor->id]);

        $response = $this->getJson("/api/suppliers/{$supplier->id}");

        $response->assertStatus(200)
                 ->assertJsonFragment(['name' => $supplier->name]);
    }

    public function test_can_update_a_supplier()
    {
        $supplier = Supplier::factory()->create(['vendor_id' => $this->vendor->id]);

        $updateData = ['name' => 'Updated Supplier Name'];

        $response = $this->putJson("/api/suppliers/{$supplier->id}", $updateData);

        $response->assertStatus(200)
                 ->assertJsonFragment($updateData);

        $this->assertDatabaseHas('suppliers', $updateData);
    }

    public function test_can_delete_a_supplier()
    {
        $supplier = Supplier::factory()->create(['vendor_id' => $this->vendor->id]);

        $response = $this->deleteJson("/api/suppliers/{$supplier->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('suppliers', ['id' => $supplier->id]);
    }
}
