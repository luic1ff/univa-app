<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class GeneratePermanentToken extends Command
{
    protected $signature = 'token:generate {user_id}';
    protected $description = 'Generate permanent API token for user';

    public function handle(): void
    {
        $user = User::query()
            ->find($this->argument('user_id'));

        if (! $user) {
            $this->error('User not found');
            return;
        }

        $user->tokens()->where('name', 'postman')->delete();

        $token = $user->createToken('postman')->plainTextToken;

        $this->info('Token generated:');
        $this->line($token);
    }
}
