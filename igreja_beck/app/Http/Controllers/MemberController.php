<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    public function index()
    {
        return response()->json(Member::with(['father', 'mother', 'spouse'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:members,email',
            'phone' => 'nullable|string',
            'birth_date' => 'nullable|date',
            'category' => 'required|string',
            'status' => 'required|string',
            'address' => 'nullable|string',
            'sex' => 'nullable|string',
            'marital_status' => 'nullable|string',
            'cpf' => 'nullable|string|unique:members,cpf',
            'cep' => 'nullable|string',
            'logradouro' => 'nullable|string',
            'bairro' => 'nullable|string',
            'cidade' => 'nullable|string',
            'uf' => 'nullable|string',
            'baptism_date' => 'nullable|date',
            'role' => 'nullable|string',
            'origin_church' => 'nullable|string',
            'father_name' => 'nullable|string',
            'mother_name' => 'nullable|string',
            'father_id' => 'nullable|exists:members,id',
            'mother_id' => 'nullable|exists:members,id',
            'spouse_id' => 'nullable|exists:members,id',
        ]);

        $member = Member::create($validated);
        return response()->json($member, 201);
    }

    public function show(Member $member)
    {
        return response()->json($member->load(['father', 'mother', 'spouse']));
    }

    public function update(Request $request, Member $member)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => 'nullable|email|unique:members,email,' . $member->id,
            'phone' => 'nullable|string',
            'birth_date' => 'nullable|date',
            'category' => 'string',
            'status' => 'string',
            'address' => 'nullable|string',
            'sex' => 'nullable|string',
            'marital_status' => 'nullable|string',
            'cpf' => 'nullable|string|unique:members,cpf,' . $member->id,
            'cep' => 'nullable|string',
            'logradouro' => 'nullable|string',
            'bairro' => 'nullable|string',
            'cidade' => 'nullable|string',
            'uf' => 'nullable|string',
            'baptism_date' => 'nullable|date',
            'role' => 'nullable|string',
            'origin_church' => 'nullable|string',
            'father_name' => 'nullable|string',
            'mother_name' => 'nullable|string',
            'father_id' => 'nullable|exists:members,id',
            'mother_id' => 'nullable|exists:members,id',
            'spouse_id' => 'nullable|exists:members,id',
        ]);

        $member->update($validated);
        return response()->json($member);
    }

    public function destroy(Member $member)
    {
        $member->delete();
        return response()->json(null, 204);
    }
}
