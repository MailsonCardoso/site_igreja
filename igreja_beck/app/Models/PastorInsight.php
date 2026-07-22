<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PastorInsight extends Model
{
    use HasFactory;

    protected $table = 'pastor_insights';

    protected $fillable = [
        'type',
        'content',
        'title',
        'reference',
        'tags',
        'sermon_id',
        'user_id'
    ];

    protected $casts = [
        'tags' => 'array'
    ];
}
