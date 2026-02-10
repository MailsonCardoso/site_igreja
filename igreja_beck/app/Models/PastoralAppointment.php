<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PastoralAppointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'title',
        'person',
        'member_id',
        'date',
        'start_time',
        'end_time',
        'location',
        'notes',
        'status'
    ];
}
