<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

class SimpleTest extends TestCase
{
    #[Test]
    public function basic_test()
    {
        $this->assertTrue(true);
    }

    #[Test]
    public function can_access_health_endpoint()
    {
        $response = $this->get('/up');
        $response->assertStatus(200);
    }
} 