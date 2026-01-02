<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Vendor;
use App\Models\Role;
use App\Models\Category;

class CategoryApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->vendor = Vendor::factory()->create();
        $this->user = User::factory()->create();
        $this->role = Role::factory()->create(['vendor_id' => $this->vendor->id, 'can_manage_categories' => true]);
        $this->user->memberships()->create([
            'vendor_id' => $this->vendor->id,
            'role_id' => $this->role->id,
        ]);

        $this->actingAs($this->user, 'api');
    }

    public function test_can_get_all_categories()
    {
        Category::factory()->count(3)->create(['vendor_id' => $this->vendor->id]);

        $response = $this->getJson('/api/categories');

        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    public function test_can_create_a_category()
    {
        $categoryData = [
            'name' => 'New Category',
            'description' => 'A new category for testing.',
            'vendor_id' => $this->vendor->id,
        ];

        $response = $this->postJson('/api/categories', $categoryData);

        $response->assertStatus(201)
                 ->assertJsonFragment($categoryData);

        $this->assertDatabaseHas('categories', $categoryData);
    }

    public function test_can_get_a_single_category()
    {
        $category = Category::factory()->create(['vendor_id' => $this->vendor->id]);

        $response = $this->getJson("/api/categories/{$category->id}");

        $response->assertStatus(200)
                 ->assertJsonFragment(['name' => $category->name]);
    }

    public function test_can_update_a_category()
    {
        $category = Category::factory()->create(['vendor_id' => $this->vendor->id]);

        $updateData = ['name' => 'Updated Category Name'];

        $response = $this->putJson("/api/categories/{$category->id}", $updateData);

        $response->assertStatus(200)
                 ->assertJsonFragment($updateData);

        $this->assertDatabaseHas('categories', $updateData);
    }

    public function test_can_delete_a_category()
    {
        $category = Category::factory()->create(['vendor_id' => $this->vendor->id]);

        $response = $this->deleteJson("/api/categories/{$category->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }
}
