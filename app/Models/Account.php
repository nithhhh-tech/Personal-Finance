<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'name', 'type', 'currency', 'starting_balance', 'current_balance'];

    protected function casts(): array
    {
        return ['starting_balance' => 'decimal:2', 'current_balance' => 'decimal:2'];
    }

    public function user() { return $this->belongsTo(User::class); }
    public function transactions() { return $this->hasMany(Transaction::class); }
}
