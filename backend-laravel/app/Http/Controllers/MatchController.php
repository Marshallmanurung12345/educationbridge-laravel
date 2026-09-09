<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use Illuminate\Http\Request;

class MatchController extends Controller
{
    // Smart Matching: donatur kirim ?focus=teknologi,3t lalu campaign diberi skor
    // berdasarkan jumlah tag yang cocok, diurutkan (match_score, priority_score) menurun.
    public function index(Request $request)
    {
        $focus = collect(explode(',', (string) $request->query('focus', '')))
            ->map(fn ($t) => strtolower(trim($t)))
            ->filter()
            ->values();

        $campaigns = Campaign::where('status', 'verified')->get();

        $scored = $campaigns->map(function (Campaign $c) use ($focus) {
            $tags = collect($c->tags ?? [])->map(fn ($t) => strtolower($t));
            $overlap = $focus->isEmpty() ? 0 : $tags->intersect($focus)->count();

            $arr = $c->toArray();
            $arr['match_score'] = $overlap;

            return $arr;
        });

        $sorted = $scored->sort(function ($a, $b) {
            return [$b['match_score'], $b['priority_score']] <=> [$a['match_score'], $a['priority_score']];
        })->values();

        return response()->json($sorted);
    }
}
