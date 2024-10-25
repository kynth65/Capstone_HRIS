<?php

namespace App\Http\Controllers;

use App\Models\RfidCard;
use Illuminate\Http\Request;

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

    public function updateStatus(Request $request, $id)
    {
        $card = RfidCard::findOrFail($id);
        $card->status = $request->status;
        $card->save();

        return response()->json(['message' => 'Status updated successfully']);
    }
}
