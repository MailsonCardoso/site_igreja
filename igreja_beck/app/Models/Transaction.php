<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'type', // entrada, saida
        'description',
        'category_name', // dízimo, oferta, aluguel, luz
        'amount', // stored in cents or decimal? Let's use decimal for simplicity in this context, or integer cents.
        'date',
        'user_id', // who created
        'receipt_url'
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
