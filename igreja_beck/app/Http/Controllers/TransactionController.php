<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::query();

        if ($request->has('month') && $request->has('year')) {
            $query->whereMonth('date', $request->month)
                  ->whereYear('date', $request->year);
        }

        return response()->json($query->orderBy('date', 'desc')->get());
    }

    public function report(Request $request)
    {
        $month = $request->query('month', now()->month);
        $year = $request->query('year', now()->year);

        // Saldo anterior (tudo antes do mês selecionado)
        $previousBalance = Transaction::where(function ($q) use ($month, $year) {
            $q->whereYear('date', '<', $year)
              ->orWhere(function ($sq) use ($month, $year) {
                  $sq->whereYear('date', $year)
                     ->whereMonth('date', '<', $month);
              });
        })->selectRaw("SUM(CASE WHEN type = 'entrada' THEN amount ELSE -amount END) as balance")
          ->value('balance') ?? 0;

        $transactions = Transaction::whereMonth('date', $month)
            ->whereYear('date', $year)
            ->get();

        $grouped = $transactions->groupBy('type')->map(function ($group) {
            return $group->groupBy('category_name')->map(function ($catGroup) {
                return [
                    'total' => (float)$catGroup->sum('amount'),
                    'count' => $catGroup->count()
                ];
            });
        });

        return response()->json([
            'month' => (int)$month,
            'year' => (int)$year,
            'previous_balance' => (float)$previousBalance,
            'grouped_data' => $grouped,
            'total_income' => (float)$transactions->where('type', 'entrada')->sum('amount'),
            'total_expense' => (float)$transactions->where('type', 'saida')->sum('amount'),
            'current_balance' => (float)($transactions->where('type', 'entrada')->sum('amount') - $transactions->where('type', 'saida')->sum('amount')),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:entrada,saida',
            'description' => 'required|string|max:255',
            'category_name' => 'required|string|max:255',
            'amount' => 'required|numeric',
            'date' => 'required|date',
            'receipt_url' => 'nullable|string',
        ]);

        $transaction = Transaction::create($validated);
        return response()->json($transaction, 201);
    }

    public function show(Transaction $transaction)
    {
        return response()->json($transaction);
    }

    public function update(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'type' => 'in:entrada,saida',
            'description' => 'string|max:255',
            'category_name' => 'string|max:255',
            'amount' => 'numeric',
            'date' => 'date',
            'receipt_url' => 'nullable|string',
        ]);

        $transaction->update($validated);
        return response()->json($transaction);
    }

    public function destroy(Transaction $transaction)
    {
        $transaction->delete();
        return response()->json(null, 204);
    }
}
