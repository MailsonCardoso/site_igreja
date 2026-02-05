<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Transaction;
use App\Models\Event;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $totalMembers = Member::where('status', 'ativo')->count();

        $totalIncome = Transaction::where('type', 'entrada')->sum('amount');
        $totalExpense = Transaction::where('type', 'saida')->sum('amount');
        $balance = $totalIncome - $totalExpense;

        $upcomingEvents = Event::where('start_date', '>=', now())
            ->orderBy('start_date', 'asc')
            ->limit(5)
            ->get();

        return response()->json([
            'members_count' => $totalMembers,
            'balance' => $balance,
            'income' => $totalIncome,
            'expense' => $totalExpense,
            'upcoming_events' => $upcomingEvents
        ]);
    }
}
