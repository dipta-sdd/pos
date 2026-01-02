<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Vendor;
use App\Models\Role;
use App\Models\UnitOfMeasure;

class UnitOfMeasureApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->vendor = Vendor::factory()->create();
        $this->user = User::factory()->create();
        $role = Role::factory()->create([
            'vendor_id' => $this->vendor->id,
            'can_manage_units_of_measure' => true,
        ]);
        $this->user->memberships()->create([
            'vendor_id' => $this->vendor->id,
            'role_id' => $role->id,
        ]);

        $this->actingAs($this->user, 'api');
    }

    public function test_can_get_all_units_of_measure()
    {
        UnitOfMeasure::factory()->count(3)->create(['vendor_id' => $this->vendor->id]);

        $response = $this->getJson('/api/units-of-measure');

        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    public function test_can_create_a_unit_of_measure()
    {
        $uomData = [
            'name' => 'Kilogram',
            'short_code' => 'kg',
            'vendor_id' => $this->vendor->id,
        ];

        $response = $this->postJson('/api/units-of-measure', $uomData);

        $response->assertStatus(201)
                 ->assertJsonFragment($uomData);

        $this->assertDatabaseHas('units_of_measure', $uomData);
    }

    public function test_can_get_a_single_unit_of_measure()
    {
        $uom = UnitOfMeasure::factory()->create(['vendor_id' => $this->vendor->id]);

        $response = $this->getJson("/api/units-of-measure/{$uom->id}");

        $response->assertStatus(200)
                 ->assertJsonFragment(['name' => $uom->name]);
    }

    public function test_can_update_a_unit_of_measure()
    {
        $uom = UnitOfMeasure::factory()->create(['vendor_id' => $this->vendor->id]);

        $updateData = ['name' => 'Liter'];

        $response = $this->putJson("/api/units-of-measure/{$uom->id}", $updateData);

        $response->assertStatus(200)
                 ->assertJsonFragment($updateData);

        $this->assertDatabaseHas('units_of_measure', $updateData);
    }

    public function test_can_delete_a_unit_of_measure()
    {
        $uom = UnitOfMeasure::factory()->create(['vendor_id' => $this->vendor->id]);

        $response = $this->deleteJson("/api/units-of-measure/{$uom->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('units_of_measure', ['id' => $uom->id]);
    }
}
