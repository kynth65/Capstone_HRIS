<?php

namespace App\Http\Controllers;

use App\Models\RfidCard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;


class RfidCardController extends Controller
{
    public function index()
    {
        $availableCards = RfidCard::where('status', 'available')->get();
        $assignedCards = RfidCard::where('status', 'assigned')->get();

        return response()->json([
            'available' => $availableCards,
            'assigned' => $assignedCards
        ]);
    }

    public function getAvailable()
    {
        $cards = RfidCard::where('status', 'available')->get();
        return response()->json($cards);
    }

    public function getAssigned()
    {
        $cards = RfidCard::where('status', 'assigned')->get();
        return response()->json($cards);
    }

    public function acknowledge($id)
    {
        $card = RfidCard::findOrFail($id);
        $card->update(['acknowledged' => true]);
        return response()->json(['message' => 'Card acknowledged successfully']);
    }

    public function assignCard($rfidUid)
    {
        $card = RfidCard::where('rfid_uid', $rfidUid)->first();

        if (!$card) {
            return response()->json(['error' => 'RFID card not found'], 404);
        }

        $card->status = 'assigned';
        $card->save();

        return response()->json(['message' => 'RFID card assigned successfully']);
    }

    public function unassignCard($rfidUid)
    {
        try {
            $card = RfidCard::where('rfid_uid', $rfidUid)->first();

            if (!$card) {
                Log::error('RFID card not found for unassignment', ['rfid_uid' => $rfidUid]);
                return response()->json(['error' => 'RFID card not found'], 404);
            }

            $card->status = 'available';
            $card->save();

            Log::info('RFID card unassigned successfully', ['rfid_uid' => $rfidUid]);
            return response()->json(['message' => 'RFID card unassigned successfully']);
        } catch (\Exception $e) {
            Log::error('Failed to unassign RFID card', [
                'rfid_uid' => $rfidUid,
                'error' => $e->getMessage()
            ]);
            return response()->json(['error' => 'Failed to unassign RFID card'], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $card = RfidCard::findOrFail($id);
        $card->status = $request->status;
        $card->save();

        return response()->json(['message' => 'Status updated successfully']);
    }
}
