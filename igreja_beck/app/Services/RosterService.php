<?php

namespace App\Services;

use App\Models\Member;
use App\Models\Ministry;
use App\Models\Roster;
use Carbon\Carbon;

class RosterService
{
    /**
     * Generate automatic rosters for a ministry for the next X weeks.
     */
    public function generateAutomatic(int $ministryId, int $weeks = 4)
    {
        $ministry = Ministry::findOrFail($ministryId);
        $members = Member::where('status', 'ativo')->get();

        if ($members->isEmpty()) {
            return ['error' => 'Nenhum membro ativo encontrado para gerar escala.'];
        }

        $results = [];
        $startDate = Carbon::now()->next('Sunday');

        for ($i = 0; $i < $weeks; $i++) {
            $date = $startDate->copy()->addWeeks($i);

            // Create the roster entry
            $roster = Roster::create([
                'ministry_id' => $ministryId,
                'date' => $date,
            ]);

            // Simple logic: Pick 3 random members for this date
            // In a real system, we would check for availability and rotation
            $selectedMembers = $members->random(min(3, $members->count()));

            foreach ($selectedMembers as $member) {
                $roster->members()->attach($member->id, [
                    'role' => $this->getRandomRole($ministry->name)
                ]);
            }

            $results[] = $roster->load('members');
        }

        return $results;
    }

    private function getRandomRole(string $ministryName): string
    {
        $roles = [
            'Louvor' => ['Vocal', 'Violão', 'Teclado', 'Bateria', 'Baixo'],
            'Recepção' => ['Portaria', 'Apoio', 'Boas-vindas'],
            'Infantil' => ['Professor', 'Auxiliar', 'Berçário'],
        ];

        $options = $roles[$ministryName] ?? ['Auxiliar'];
        return $options[array_rand($options)];
    }
}
