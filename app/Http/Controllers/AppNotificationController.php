<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AppNotificationController extends Controller
{
    public function markAsRead(Request $request, $id)
    {
        try {
            $notification = $request->user()->notifications()
                ->where('id', $id)
                ->firstOrFail();

            $notification->markAsRead();

            return response()->json(['message' => 'Notification marked as read.']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Notification not found.'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred while marking the notification as read.'], 500);
        }
    }

    public function markAllAsRead(Request $request)
    {
        try {
            $user = $request->user();
            $user->unreadNotifications->markAsRead();

            return response()->json(['message' => 'All notifications marked as read.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred while marking all notifications as read.'], 500);
        }
    }

    public function markAsUnread(Request $request, $id)
    {
        try {
            $notification = $request->user()->notifications()
                ->where('id', $id)
                ->firstOrFail();

            $notification->markAsUnread();

            return response()->json(['message' => 'Notification marked as unread.']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Notification not found.'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred while marking the notification as unread.'], 500);
        }
    }
}
