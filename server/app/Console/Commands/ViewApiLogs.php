<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;

class ViewApiLogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'logs:view-api 
                            {date? : The date of the log file to view (YYYY-MM-DD). Defaults to today.}
                            {--user= : Filter logs by a specific User ID.}
                            {--status= : Filter logs by a specific HTTP status code.}
                            {--uri= : Filter logs by a URI containing the given string.}
                            {--limit=50 : The number of recent log entries to display.}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Displays structured API request logs in a readable table format.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            $date = $this->argument('date') ? Carbon::parse($this->argument('date')) : Carbon::today();
            $logPath = storage_path('logs/api_analytics-' . $date->format('Y-m-d') . '.log');

            if (!File::exists($logPath)) {
                $this->error("Log file not found at: {$logPath}");
                return 1; // Error exit code
            }

            $lines = file($logPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            if (empty($lines)) {
                $this->info("No log entries found for {$date->format('Y-m-d')}.");
                return 0;
            }

            $logs = [];
            foreach ($lines as $line) {
                $data = json_decode($line, true);

                // Basic check for valid JSON structure
                if (json_last_error() !== JSON_ERROR_NONE || !isset($data['context'])) {
                    continue;
                }

                $context = $data['context'];

                // Apply filters
                if ($this->option('user') && ($context['user_id'] ?? null) != $this->option('user')) {
                    continue;
                }
                if ($this->option('status') && $context['status_code'] != $this->option('status')) {
                    continue;
                }
                if ($this->option('uri') && !str_contains($context['uri'], $this->option('uri'))) {
                    continue;
                }

                // Prepare the row for the table
                $logs[] = [
                    'timestamp' => Carbon::parse($data['datetime'])->format('Y-m-d H:i:s'),
                    'method' => $context['method'],
                    'uri' => $context['uri'],
                    'status' => $this->formatStatusCode($context['status_code']),
                    'user_id' => $context['user_id'] ?? 'Guest',
                    'vendor_id' => $context['vendor_id'] ?? 'N/A',
                    'response_time' => $context['response_time_ms'] . 'ms',
                ];
            }

            if (empty($logs)) {
                $this->info("No log entries match your filter criteria for {$date->format('Y-m-d')}.");
                return 0;
            }

            // Get the last N entries based on the limit
            $limit = (int) $this->option('limit');
            $displayLogs = array_slice($logs, -$limit);

            $headers = ['Timestamp', 'Method', 'URI', 'Status', 'User ID', 'Vendor ID', 'Time'];
            $this->table($headers, $displayLogs);

            $this->info("Showing the last " . count($displayLogs) . " of " . count($logs) . " total matching entries.");

        } catch (\Exception $e) {
            $this->error("An error occurred: " . $e->getMessage());
            return 1;
        }

        return 0; // Success exit code
    }

    /**
     * Formats the status code with color for better readability in the terminal.
     *
     * @param int $statusCode
     * @return string
     */
    private function formatStatusCode(int $statusCode): string
    {
        if ($statusCode >= 500) {
            return "<fg=red>{$statusCode}</>"; // Server Error
        }
        if ($statusCode >= 400) {
            return "<fg=yellow>{$statusCode}</>"; // Client Error
        }
        if ($statusCode >= 300) {
            return "<fg=cyan>{$statusCode}</>"; // Redirection
        }
        if ($statusCode >= 200) {
            return "<fg=green>{$statusCode}</>"; // Success
        }
        return (string) $statusCode;
    }
}
