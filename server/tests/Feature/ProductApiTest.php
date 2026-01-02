<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Vendor;
use App\Models\Role;
use App\Models\Product;
use App\Models\Category;
use App\Models\UnitOfMeasure;

class ProductApiTest extends TestCase
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
        $this->role = Role::factory()->create($roleData);
        $this->user->memberships()->create([
            'vendor_id' => $this->vendor->id,
            'role_id' => $this->role->id,
        ]);

        $this->actingAs($this->user, 'api');
    }

    public function test_can_get_all_products_with_permission()
    {
        $this->setupUserWithPermissions(['can_view_products' => true]);
        Product::factory()->count(3)->create(['vendor_id' => $this->vendor->id]);

        $response = $this->getJson('/api/products');

        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    public function test_cannot_get_all_products_without_permission()
    {
        $this->setupUserWithPermissions(['can_view_products' => false]);
        $response = $this->getJson('/api/products');
        $response->assertStatus(403);
    }

    public function test_can_create_a_product_with_permission()
    {
        $this->setupUserWithPermissions(['can_manage_products' => true]);
        $category = Category::factory()->create(['vendor_id' => $this->vendor->id]);
        $uom = UnitOfMeasure::factory()->create(['vendor_id' => $this->vendor->id]);

        $productData = [
            'name' => 'New Product',
            'description' => 'A new product for testing.',
            'vendor_id' => $this->vendor->id,
            'category_id' => $category->id,
            'unit_of_measure_id' => $uom->id,
        ];

        $response = $this->postJson('/api/products', $productData);

        $response->assertStatus(201)
                 ->assertJsonFragment(['name' => 'New Product']);

        $this->assertDatabaseHas('products', ['name' => 'New Product']);
    }

    // ... more tests for update, delete, show, and sad paths
}
