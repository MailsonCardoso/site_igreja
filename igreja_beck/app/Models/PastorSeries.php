<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PastorSeries extends Model
{
    use HasFactory;

    protected $table = 'pastor_series';

    protected $fillable = [
        'title',
        'description',
        'total',
        'completed',
        'color',
        'cover_color',
        'start_date',
        'user_id'
    ];

    protected $casts = [
        'start_date' => 'date'
    ];
}
