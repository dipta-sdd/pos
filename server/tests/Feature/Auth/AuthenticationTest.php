<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\Test;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $userData;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->userData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123'
        ];
    }

    #[Test]
    public function user_can_register_with_valid_data()
    {
        $response = $this->postJson('/api/auth/register', $this->userData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'message',
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'created_at',
                        'updated_at'
                    ]
                ])
                ->assertJson([
                    'message' => 'User successfully registered',
                    'user' => [
                        'name' => 'John Doe',
                        'email' => 'john@example.com'
                    ]
                ]);

        $this->assertDatabaseHas('users', [
            'name' => 'John Doe',
            'email' => 'john@example.com'
        ]);
    }

    #[Test]
    public function user_can_login_with_valid_credentials()
    {
        // Create user first
        $this->postJson('/api/auth/register', $this->userData);

        $loginData = [
            'email' => 'john@example.com',
            'password' => 'password123'
        ];

        $response = $this->postJson('/api/auth/login', $loginData);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'access_token',
                    'token_type',
                    'expires_in',
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'created_at',
                        'updated_at'
                    ]
                ])
                ->assertJson([
                    'token_type' => 'bearer',
                    'user' => [
                        'name' => 'John Doe',
                        'email' => 'john@example.com'
                    ]
                ]);

        $this->assertNotEmpty($response->json('access_token'));
    }

    #[Test]
    public function authenticated_user_can_access_profile()
    {
        // Create and login user
        $this->postJson('/api/auth/register', $this->userData);
        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => 'john@example.com',
            'password' => 'password123'
        ]);

        $token = $loginResponse->json('access_token');

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->getJson('/api/auth/me');

        $response->assertStatus(200)
                ->assertJson([
                    'name' => 'John Doe',
                    'email' => 'john@example.com'
                ]);
    }

    #[Test]
    public function unauthenticated_user_cannot_access_profile()
    {
        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(401);
    }
}
