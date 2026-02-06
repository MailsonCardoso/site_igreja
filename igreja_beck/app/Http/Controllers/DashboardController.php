<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Transaction;
use App\Models\Event;
use App\Models\Cell;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // Total de membros ativos
        $totalMembers = Member::where('status', 'ativo')->count();

        // Finanças
        $totalIncome = Transaction::where('type', 'entrada')->sum('amount');
        $totalExpense = Transaction::where('type', 'saida')->sum('amount');
        $balance = $totalIncome - $totalExpense;

        // Próximos eventos
        $upcomingEvents = Event::where('start_date', '>=', now())
            ->orderBy('start_date', 'asc')
            ->limit(5)
            ->get();

        // Total de células ativas
        $totalCells = Cell::count();

        // Aniversariantes do mês atual
        $currentMonth = now()->month;
        $birthdays = Member::whereRaw('MONTH(birth_date) = ?', [$currentMonth])
            ->where('status', 'ativo')
            ->orderByRaw('DAY(birth_date)')
            ->get(['id', 'name', 'birth_date'])
            ->map(function ($member) {
                return [
                    'id' => $member->id,
                    'name' => $member->name,
                    'day' => $member->birth_date ? date('d', strtotime($member->birth_date)) : null,
                    'avatar' => strtoupper(substr($member->name, 0, 2)),
                ];
            });

        return response()->json([
            'members_count' => $totalMembers,
            'balance' => $balance,
            'income' => $totalIncome,
            'expense' => $totalExpense,
            'cells_count' => $totalCells,
            'birthdays' => $birthdays,
            'upcoming_events' => $upcomingEvents
        ]);
    }
}
