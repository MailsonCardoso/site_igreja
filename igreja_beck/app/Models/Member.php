<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'birth_date',
        'category', // membro, visitante
        'status',   // ativo, inativo, disciplina
        'address',
        'photo_url'
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];
}
