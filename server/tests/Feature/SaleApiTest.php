<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Vendor;
use App\Models\Role;
use App\Models\Sale;
use App\Models\Branch;
use App\Models\BillingCounter;
use App\Models\CashRegisterSession;
use App\Models\BranchProduct;
use App\Models\PaymentMethod;

class SaleApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->vendor = Vendor::factory()->create();
        $this->user = User::factory()->create();
        $this->branch = Branch::factory()->create(['vendor_id' => $this->vendor->id]);
        $role = Role::factory()->create([
            'vendor_id' => $this->vendor->id,
            'can_use_pos' => true,
            'can_view_sales_history' => true,
        ]);
        $this->user->memberships()->create([
            'vendor_id' => $this->vendor->id,
            'role_id' => $role->id,
        ]);

        $this->actingAs($this->user, 'api');
    }

    public function test_can_create_a_sale()
    {
        $billingCounter = BillingCounter::factory()->create(['branch_id' => $this->branch->id]);
        $cashSession = CashRegisterSession::factory()->create(['billing_counter_id' => $billingCounter->id]);
        $branchProduct = BranchProduct::factory()->create(['branch_id' => $this->branch->id]);
        $paymentMethod = PaymentMethod::factory()->create(['vendor_id' => $this->vendor->id]);

        $saleData = [
            'branch_id' => $this->branch->id,
            'user_id' => $this->user->id,
            'billing_counter_id' => $billingCounter->id,
            'cash_register_session_id' => $cashSession->id,
            'subtotal_amount' => 100,
            'final_amount' => 100,
            'status' => 'completed',
            'vendor_id' => $this->vendor->id,
            'items' => [
                [
                    'branch_product_id' => $branchProduct->id,
                    'quantity' => 1,
                    'sell_price_at_sale' => 100,
                    'line_total' => 100,
                ],
            ],
            'payments' => [
                [
                    'payment_method_id' => $paymentMethod->id,
                    'amount' => 100,
                ],
            ],
        ];

        $response = $this->postJson('/api/sales', $saleData);

        $response->assertStatus(201)
                 ->assertJsonFragment(['final_amount' => 100]);

        $this->assertDatabaseHas('sales', ['final_amount' => 100]);
        $this->assertDatabaseHas('sale_items', ['line_total' => 100]);
        $this->assertDatabaseHas('sale_payments', ['amount' => 100]);
    }
}
