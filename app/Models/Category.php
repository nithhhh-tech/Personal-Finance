<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'parent_id', 'name', 'type', 'icon', 'color', 'default_amount'];

    public function user() { return $this->belongsTo(User::class); }
    public function transactions() { return $this->hasMany(Transaction::class); }
    public function parent() { return $this->belongsTo(Category::class, 'parent_id'); }
    public function subcategories() { return $this->hasMany(Category::class, 'parent_id'); }
}
