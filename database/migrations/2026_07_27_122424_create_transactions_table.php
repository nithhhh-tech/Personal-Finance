<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->string('type');
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('USD');
            $table->decimal('base_amount', 12, 2);
            $table->decimal('exchange_rate', 12, 6)->default(1);
            $table->date('transaction_date');
            $table->string('payment_method')->nullable();
            $table->text('description')->nullable();
            $table->json('tags')->nullable();
            $table->string('receipt_url')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'transaction_date', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
