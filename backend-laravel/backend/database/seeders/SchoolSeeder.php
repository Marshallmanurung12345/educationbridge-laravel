<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;

class SchoolSeeder extends Seeder
{
    public function run(): void
    {
        Artisan::call('import:official-schools');
    }
}