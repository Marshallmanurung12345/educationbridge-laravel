<?php

namespace App\Http\Controllers;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class RegionController extends Controller
{
    private const LEVELS = [
        'provinces' => '/^\d{2}$/',
        'regencies' => '/^\d{2}\.\d{2}$/',
        'districts' => '/^\d{2}\.\d{2}\.\d{2}$/',
        'villages' => '/^\d{2}\.\d{2}\.\d{2}\.\d{4}$/',
    ];

    public function index(string $level, ?string $parentCode = null)
    {
        if (! array_key_exists($level, self::LEVELS)) {
            return response()->json(['message' => 'Tingkat wilayah tidak valid.'], 404);
        }

        if ($level === 'provinces' && $parentCode !== null) {
            return response()->json(['message' => 'Provinsi tidak memerlukan kode induk.'], 422);
        }

        if ($level !== 'provinces') {
            $parentLevel = match ($level) {
                'regencies' => 'provinces',
                'districts' => 'regencies',
                'villages' => 'districts',
            };
            $parentPattern = self::LEVELS[$parentLevel];

            if ($parentCode === null || ! preg_match($parentPattern, $parentCode)) {
                return response()->json(['message' => 'Kode wilayah induk tidak valid.'], 422);
            }
        }

        $path = $parentCode
            ? "{$level}/{$parentCode}.json"
            : "{$level}.json";

        try {
            $upstream = Http::acceptJson()
                ->timeout(10)
                ->get("https://wilayah.id/api/{$path}");
        } catch (ConnectionException) {
            return response()->json([
                'message' => 'Layanan data wilayah sedang tidak dapat dihubungi. Coba lagi sebentar.',
            ], 502);
        }

        $data = $upstream->json('data');
        if (! $upstream->successful() || ! is_array($data)) {
            return response()->json([
                'message' => 'Layanan data wilayah mengembalikan respons yang tidak valid.',
            ], 502);
        }

        return response()->json(['data' => $data]);
    }
}
