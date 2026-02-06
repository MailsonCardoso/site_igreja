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
        // Total de membros ativos (considerando apenas Membros e Congregados)
        $totalMembers = Member::whereIn('status', ['ativo', 'membro', 'congregado', 'disciplina'])->count();

        // Total de visitantes
        $totalVisitors = Member::where('status', 'visitante')->count();

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
        $activeStatuses = ['ativo', 'membro', 'congregado', 'visitante', 'disciplina'];
        $currentMonth = now()->month;
        $birthdays = Member::whereRaw('MONTH(birth_date) = ?', [$currentMonth])
            ->whereIn('status', $activeStatuses)
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

        // Crescimento de membros nos últimos 6 meses
        $memberGrowth = Member::selectRaw('MONTH(created_at) as month, YEAR(created_at) as year, COUNT(*) as count')
            ->where('created_at', '>=', now()->subMonths(5)->startOfMonth())
            ->groupBy('year', 'month')
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get()
            ->map(function ($row) {
                $monthName = \Carbon\Carbon::createFromDate($row->year, $row->month, 1)->locale('pt_BR')->monthName;
                return [
                    'mes' => ucfirst($monthName),
                    'novos' => $row->count
                ];
            });

        return response()->json([
            'members_count' => $totalMembers,
            'visitors_count' => $totalVisitors,
            'balance' => $balance,
            'income' => $totalIncome,
            'expense' => $totalExpense,
            'cells_count' => $totalCells,
            'birthdays' => $birthdays,
            'member_growth' => $memberGrowth,
            'upcoming_events' => $upcomingEvents
        ]);
    }
}
