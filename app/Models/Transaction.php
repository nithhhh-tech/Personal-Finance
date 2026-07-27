<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'account_id', 'category_id', 'type', 'amount', 'currency', 'base_amount', 'exchange_rate', 'transaction_date', 'payment_method', 'description', 'tags', 'receipt_url'];

    protected function casts(): array
    {
        return ['amount' => 'decimal:2', 'base_amount' => 'decimal:2', 'exchange_rate' => 'decimal:6', 'transaction_date' => 'date', 'tags' => 'array'];
    }

    public function user() { return $this->belongsTo(User::class); }
    public function account() { return $this->belongsTo(Account::class); }
    public function category() { return $this->belongsTo(Category::class); }
}
