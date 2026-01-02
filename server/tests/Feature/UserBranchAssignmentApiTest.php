<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Vendor;
use App\Models\Role;
use App\Models\UserBranchAssignment;

class UserBranchAssignmentApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->vendor = Vendor::factory()->create();
        $this->user = User::factory()->create();
        // Set up role with specific permissions for this test
        // $role = Role::factory()->create(['vendor_id' => $this->vendor->id, 'permission_name' => true]);
        // $this->user->memberships()->create([
        //     'vendor_id' => $this->vendor->id,
        //     'role_id' => $role->id,
        // ]);

        $this->actingAs($this->user, 'api');
    }

    // Add tests here...
}
