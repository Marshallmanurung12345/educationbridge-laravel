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

        return response()->json($query->orderBy('name')->get());
    }

    // Detail data sekolah resmi berdasarkan NPSN
    public function show($npsn)
    {
        $school = School::where('npsn', $npsn)->orWhere('id', $npsn)->firstOrFail();
        return response()->json($school->load('campaigns'));
    }
}