<?php

namespace App\Http\Controllers;

use App\Models\Cell;
use Illuminate\Http\Request;

class CellController extends Controller
{
    public function index()
    {
        return response()->json(Cell::with(['leader', 'members'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'leader_id' => 'nullable|exists:members,id',
            'meeting_day' => 'nullable|string',
            'meeting_time' => 'nullable|string',
            'capacity' => 'nullable|integer',
            'description' => 'nullable|string',
        ]);

        $cell = Cell::create($validated);
        return response()->json($cell, 201);
    }

    public function show(Cell $cell)
    {
        return response()->json($cell->load(['leader', 'members']));
    }

    public function update(Request $request, Cell $cell)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'leader_id' => 'nullable|exists:members,id',
            'meeting_day' => 'nullable|string',
            'meeting_time' => 'nullable|string',
            'capacity' => 'nullable|integer',
            'description' => 'nullable|string',
        ]);

        $cell->update($validated);
        return response()->json($cell);
    }

    public function destroy(Cell $cell)
    {
        $cell->delete();
        return response()->json(null, 204);
    }
}
