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
        if ($type === 'email') {
            // $this->sendEmail($identifier, $otp);
        } else {
            $this->sendSMS($identifier, $otp);
        }

        // Return true for now
        return true;
    }

    private function sendSMS($identifier, $otp)
    {
        try {
            $url = "http://bulksmsbd.net/api/smsapi";
            $message = "Your NexusPos OTP is: {$otp}";

            $data = [
                "api_key" => env('SMS_API_KEY'),
                "senderid" => env('SMS_SENDER_ID'),
                "number" => $identifier,
                "message" => $message
            ];
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            $response = curl_exec($ch);
            curl_close($ch);
            Log::info("SMS sent successfully");
            Log::info(json_encode($response));

            return true;
        } catch (\Throwable $th) {
            Log::error("Failed to send SMS: " . $th->getMessage());
            return false;
        }
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
