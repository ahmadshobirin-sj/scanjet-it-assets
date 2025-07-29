<?php

namespace App\Http\Services;

use App\Models\Asset;
use App\Models\ExternalUser;
use App\Notifications\AssetAssignmentConfirmation;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;

class NotificationService
{
    public function sendAssetAssignmentConfirmation(array $assetAssignment): void
    {
        $asignedUser = ExternalUser::select(['id', 'name', 'email', 'job_title', 'office_location', 'mailbox_timezone'])
            ->where('id', $assetAssignment['assigned_user_id'])
            ->firstOrFail();

        $assets = Asset::select(['id', 'name', 'serial_number', 'asset_tag', 'category_id', 'manufacture_id'])
            ->with(['category:id,name', 'manufacture:id,name'])
            ->whereIn('id', $assetAssignment['asset_ids'])
            ->get();

        $data = [
            'assets' => $assets->toArray(),
            'assigned_user' => $asignedUser->toArray(),
            'assigned_at' => $assetAssignment['assigned_at'],
            'assigned_by' => Auth::id(),
            'notes' => $assetAssignment['notes'] ?? null,
        ];

        /**
         * Send notification to the assigned user but in database, notiefable nya is user logged in
         */
        Notification::route('mail', $asignedUser->email)
            ->notify(new AssetAssignmentConfirmation($data));
    }
}
