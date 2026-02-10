<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PastoralRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'person',
        'member_id',
        'type',
        'reason',
        'notes',
        'requested_at',
        'status'
    ];

    protected $casts = [
        'requested_at' => 'datetime',
    ];
}
