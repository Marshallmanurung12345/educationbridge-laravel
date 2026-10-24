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

        $summary = $request->boolean('summary');
        $query = Campaign::query();
        if ($summary) {
            $query
                ->select([
                    'id',
                    'school_id',
                    'school_name',
                    'location',
                    'category',
                    'title',
                    'end_date',
                    'target_amount',
                    'raised_amount',
                    'student_count',
                    'urgency',
                    'image_url',
                    'status',
                    'priority_score',
                    'tags',
                ])
                ->with('school:id,npsn,name,provinsi,kabupaten_kota,kecamatan,desa_kelurahan,jumlah_siswa,jumlah_guru,is_3t,status_3t_detail,data_source');
        } else {
            $query->with(['school', 'user:id,name,organization_name']);
        }

        $campaigns = $query->where('status', 'verified')->get();

        $scored = $campaigns->map(function (Campaign $c) use ($focus, $summary) {
            $tags = collect($c->tags ?? [])->map(fn ($t) => strtolower($t));
            $overlap = $focus->isEmpty() ? 0 : $tags->intersect($focus)->count();

            if ($summary) {
                $c->makeHidden(['user_id', 'priority_breakdown']);
            }
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
