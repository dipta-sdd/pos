<?php

namespace App\Http\Controllers;

use App\Models\Otp;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OtpController extends Controller
{
    // Mock sending OTP function
    private function sendOtpMessage($identifier, $otp, $type)
    {
        // TODO: Integrate actual SMS/Email API
        Log::info("Sending OTP {$otp} to {$identifier} for {$type}");

        // Return true for now
        return true;
    }

    public function send(Request $request)
    {
        $request->validate([
            'type' => 'required|in:email,mobile,all',
        ]);

        $user = $request->user();
        $type = $request->type;
        $sentTo = [];

        $typesToSend = $type === 'all' ? ['email', 'mobile'] : [$type];

        foreach ($typesToSend as $t) {
            $identifier = $t === 'email' ? $user->email : $user->mobile;

            if (!$identifier) {
                continue; // Skip if no identifier (e.g. no mobile)
            }

            // Generate 6 digit OTP
            $otpCode = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
            $dbType = $t === 'email' ? 'email_verification' : 'phone_verification';

            $expiresAt = Carbon::now()->addMinutes(5);
            Otp::create([
                'user_id' => $user->id,
                'otp' => $otpCode,
                'identifier' => $identifier,
                'type' => $dbType,
                'expires_at' => $expiresAt,
            ]);

            $this->sendOtpMessage($identifier, $otpCode, $t);
            $sentTo[] = $t;
        }

        if (empty($sentTo)) {
            return response()->json(['message' => 'No valid contact details found.'], 400);
        }

        // Return the expiry time of the last generated OTP (they are all same time approx)
        return response()->json([
            'message' => 'OTP sent successfully to ' . implode(' and ', $sentTo),
            'expires_at' => Carbon::now()->addMinutes(5)->toISOString()
        ]);
    }

    public function verify(Request $request)
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        $user = $request->user();

        $otpRecord = Otp::where('user_id', $user->id)
            ->where('otp', $request->otp)
            ->where('verified_at', null)
            ->where('expires_at', '>', Carbon::now())
            ->latest()
            ->first();

        if (!$otpRecord) {
            return response()->json(['message' => 'Invalid or expired OTP'], 400);
        }

        // Verify
        DB::transaction(function () use ($user, $otpRecord) {
            $otpRecord->update(['verified_at' => Carbon::now()]);

            $verifiedType = '';
            if ($otpRecord->type === 'email_verification') {
                $user->email_verified_at = Carbon::now();
                $verifiedType = 'email';
            } elseif ($otpRecord->type === 'phone_verification') {
                $user->mobile_verified_at = Carbon::now();
                $verifiedType = 'mobile';
            }

            $user->save();
        });

        return response()->json(['message' => 'Verified successfully']);
    }
}
