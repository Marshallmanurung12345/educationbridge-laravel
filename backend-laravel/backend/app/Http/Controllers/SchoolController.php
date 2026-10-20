<?php

namespace App\Http\Controllers;

use App\Models\School;
use Illuminate\Http\Request;

class SchoolController extends Controller
{
    // Search or list official Kemendikdasmen school dataset
    public function index(Request $request)
    {
        $query = School::query();

        if ($request->filled('q')) {
            $q = $request->query('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'LIKE', "%{$q}%")
                    ->orWhere('npsn', 'LIKE', "%{$q}%")
                    ->orWhere('provinsi', 'LIKE', "%{$q}%")
                    ->orWhere('kabupaten_kota', 'LIKE', "%{$q}%");
            });
        }

        if ($request->filled('is_3t')) {
            $query->where('is_3t', filter_var($request->query('is_3t'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('jenjang')) {
            $query->where('jenjang', $request->query('jenjang'));
        }

        if ($request->filled('provinsi')) {
            $query->where('provinsi', $request->query('provinsi'));
        }

        if ($request->filled('kabupaten_kota')) {
            $query->where('kabupaten_kota', $request->query('kabupaten_kota'));
        }

        $query->orderBy('name');
        if ($request->filled('limit')) {
            $limit = max(1, min(50, $request->integer('limit', 20)));
            $query->limit($limit);
        }

        return response()->json($query->get());
    }

    // Detail data sekolah resmi berdasarkan NPSN
    public function show($npsn)
    {
        $school = School::where('npsn', $npsn)->orWhere('id', $npsn)->firstOrFail();
        $school->load([
            'campaigns' => fn ($query) => $query->where('status', 'verified'),
        ]);
        $school->campaigns->each(fn ($campaign) => $campaign->makeHidden('user_id'));

        return response()->json($school);
    }
}