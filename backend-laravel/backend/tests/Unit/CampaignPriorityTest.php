<?php

namespace Tests\Unit;

use App\Models\Campaign;
use PHPUnit\Framework\TestCase;

class CampaignPriorityTest extends TestCase
{
    public function test_score_uses_the_documented_component_weights_and_limits(): void
    {
        $this->assertSame(100, Campaign::computePriorityScore(5, 1, 5, 1000, 1));
        $this->assertSame(16, Campaign::computePriorityScore(1, 5, 1, 0, 5));
        $this->assertSame(
            Campaign::computePriorityScore(3, 3, 3, 1000, 3),
            Campaign::computePriorityScore(3, 3, 3, 2000, 3),
        );
    }

    public function test_priority_labels_follow_the_score_thresholds(): void
    {
        $campaign = new Campaign;

        $campaign->priority_score = 80;
        $this->assertSame('Sangat Prioritas', $campaign->priority_label);

        $campaign->priority_score = 60;
        $this->assertSame('Prioritas Tinggi', $campaign->priority_label);

        $campaign->priority_score = 40;
        $this->assertSame('Prioritas Sedang', $campaign->priority_label);

        $campaign->priority_score = 39;
        $this->assertSame('Prioritas Standar', $campaign->priority_label);
    }
}
