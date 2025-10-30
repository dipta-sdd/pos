<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class LogApiRequest
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Record the start time
        $startTime = microtime(true);

        // Allow the request to proceed and get the response
        $response = $next($request);

        // Record the end time
        $endTime = microtime(true);

        // Prepare the structured data context
        $context = [
            'method' => $request->getMethod(),
            'uri' => $request->path(),
            'status_code' => $response->getStatusCode(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'user_id' => $request->user() ? $request->user()->id : null,
            'response_time_ms' => round(($endTime - $startTime) * 1000),
        ];

        // Write the log using our dedicated channel
        Log::channel('api_analytics')->info('API Request', $context);

        return $response;
    }
}
