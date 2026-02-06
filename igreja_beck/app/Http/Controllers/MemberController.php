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
            'cell_id' => 'nullable|exists:cells,id',
        ], [
            'name.required' => 'O nome é obrigatório.',
            'cpf.unique' => 'Este CPF já está cadastrado em nosso sistema.',
            'email.unique' => 'Este e-mail já está sendo utilizado.',
            'email.email' => 'Informe um e-mail válido.',
            'category.required' => 'A categoria é obrigatória.',
            'status.required' => 'A situação é obrigatória.',
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
            'cell_id' => 'nullable|exists:cells,id',
        ], [
            'cpf.unique' => 'Este CPF já está cadastrado em outro membro.',
            'email.unique' => 'Este e-mail já está sendo utilizado.',
            'email.email' => 'Informe um e-mail válido.',
        ]);

        $member->update($validated);
        return response()->json($member);
    }

    public function destroy(Member $member)
    {
        $member->delete();
        return response()->json(null, 204);
    }

    public function findByRole(Request $request)
    {
        $role = $request->query('role');
        if (!$role) {
            return response()->json(['message' => 'O cargo é obrigatório'], 400);
        }

        // Flexibiliza a busca: remove o final da palavra para aceitar variações (o/a)
        $flexibleRole = rtrim($role, 'oáéíóú');
        if (strlen($flexibleRole) > 4) {
            $flexibleRole = substr($flexibleRole, 0, -1);
        }

        $member = Member::where(function ($query) use ($role, $flexibleRole) {
            $query->where('role', 'LIKE', '%' . $role . '%')
                ->orWhere('role', 'LIKE', '%' . $flexibleRole . '%');
        })
            ->whereNotNull('cpf')
            ->first();

        if (!$member) {
            return response()->json(['message' => 'Nenhum membro encontrado com este cargo ou cargo sem CPF cadastrado'], 404);
        }

        return response()->json($member);
    }
}
