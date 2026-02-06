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
        'category',
        'status',
        'address',
        'photo_url',
        'sex',
        'marital_status',
        'cpf',
        'cep',
        'logradouro',
        'bairro',
        'cidade',
        'uf',
        'baptism_date',
        'role',
        'origin_church',
        'father_name',
        'mother_name',
        'father_id',
        'mother_id',
        'spouse_id',
        'cell_id'
    ];

    protected $casts = [
        'birth_date' => 'date',
        'baptism_date' => 'date',
    ];

    public function cell()
    {
        return $this->belongsTo(Cell::class);
    }

    public function father()
    {
        return $this->belongsTo(Member::class, 'father_id');
    }

    public function mother()
    {
        return $this->belongsTo(Member::class, 'mother_id');
    }

    public function spouse()
    {
        return $this->belongsTo(Member::class, 'spouse_id');
    }
}
