<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PastorSermon extends Model
{
    use HasFactory;

    protected $table = 'pastor_sermons';

    protected $fillable = [
        'title',
        'series',
        'verse',
        'date',
        'status',
        'color',
        'content',
        'user_id'
    ];

    protected $casts = [
        'content' => 'array',
        'date' => 'date'
    ];
}
