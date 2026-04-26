<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

trait LogsActivity
{
    protected static function bootLogsActivity()
    {
        static::created(function ($model) {
            $model->logActivity('created', null, $model->getAttributes());
        });

        static::updated(function ($model) {
            $old = array_intersect_key($model->getOriginal(), $model->getDirty());
            $new = $model->getDirty();
            
            if (!empty($new)) {
                $model->logActivity('updated', $old, $new);
            }
        });

        static::deleted(function ($model) {
            $model->logActivity('deleted', $model->getAttributes(), null);
        });
    }

    public function logActivity($action, $oldValues = null, $newValues = null, $description = null)
    {
        $user = Auth::user();
        
        // Skip logging if no vendor context is available for now, 
        // though most models should have vendor_id
        $vendorId = $this->vendor_id ?? Request::get('vendor_id') ?? Request::input('vendor_id');

        if (!$vendorId && $user) {
            // Fallback to user's first membership if available
            $vendorId = $user->memberships()->first()?->vendor_id;
        }

        if (!$vendorId) return;

        ActivityLog::create([
            'vendor_id' => $vendorId,
            'branch_id' => Request::get('branch_id') ?? Request::input('branch_id'),
            'user_id' => $user?->id,
            'action' => $action,
            'model_type' => get_class($this),
            'model_id' => $this->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'description' => $description ?? "{$action} " . class_basename($this),
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }
}
