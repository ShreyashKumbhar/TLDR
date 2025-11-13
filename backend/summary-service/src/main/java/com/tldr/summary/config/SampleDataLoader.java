package com.tldr.summary.config;

import com.tldr.summary.model.Summary;
import com.tldr.summary.repository.SummaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class SampleDataLoader implements CommandLineRunner {

    private final SummaryRepository summaryRepository;

    @Override
    public void run(String... args) {
        if (summaryRepository.count() > 0) {
            return;
        }

        Summary aiBreakthrough = new Summary();
        aiBreakthrough.setTitle("AI Model Beats Human Experts in Complex Reasoning Benchmarks");
        aiBreakthrough.setContent("""
                A new hybrid AI architecture combining large-language models with symbolic reasoning achieved state-of-the-art scores on reasoning-heavy benchmarks. Researchers say the approach drastically reduces hallucinations and unlocks explainability, paving the way for safer deployments in healthcare and finance.
                """.trim());
        aiBreakthrough.setOriginalUrl("https://example.com/articles/ai-hybrid-experts");
        aiBreakthrough.setUserId(1L);
        aiBreakthrough.setTags(Set.of("technology", "ai", "research"));
        aiBreakthrough.setCreatedAt(LocalDateTime.now().minusHours(3));
        aiBreakthrough.setVoteCount(42);
        aiBreakthrough.setCommentCount(12);

        Summary climateDigest = new Summary();
        climateDigest.setTitle("Global Climate Report Shows Record-Breaking Renewable Adoption");
        climateDigest.setContent("""
                The International Energy Agency reported that renewable capacity grew by 50% year-over-year, led by solar deployments in India and energy storage breakthroughs in Europe. Analysts expect the rapid adoption to help several countries hit interim 2030 targets ahead of schedule.
                """.trim());
        climateDigest.setOriginalUrl("https://example.com/articles/renewable-adoption-2025");
        climateDigest.setUserId(2L);
        climateDigest.setTags(Set.of("climate", "energy", "policy"));
        climateDigest.setCreatedAt(LocalDateTime.now().minusHours(6));
        climateDigest.setVoteCount(28);
        climateDigest.setCommentCount(8);

        Summary spaceUpdate = new Summary();
        spaceUpdate.setTitle("Reusable Lunar Lander Completes Successful Sixth Mission");
        spaceUpdate.setContent("""
                A private space company completed a sixth flawless mission with its reusable lunar lander, deploying scientific payloads and returning samples from the Shackleton crater. Scientists highlighted the mission as a major milestone toward establishing a permanent lunar research base.
                """.trim());
        spaceUpdate.setOriginalUrl("https://example.com/articles/lunar-lander-milestone");
        spaceUpdate.setUserId(3L);
        spaceUpdate.setTags(Set.of("space", "science", "innovation"));
        spaceUpdate.setCreatedAt(LocalDateTime.now().minusDays(1));
        spaceUpdate.setVoteCount(35);
        spaceUpdate.setCommentCount(5);

        Summary healthBreakthrough = new Summary();
        healthBreakthrough.setTitle("Breakthrough Microbiome Therapy Shows Promise Against Chronic Illness");
        healthBreakthrough.setContent("""
                A peer-reviewed study revealed that an engineered microbiome therapy significantly improved outcomes for patients with long-term autoimmune conditions. Clinical trials across three continents reported consistent symptom relief with minimal side effects, opening a new frontier for personalized medicine.
                """.trim());
        healthBreakthrough.setOriginalUrl("https://example.com/articles/microbiome-therapy");
        healthBreakthrough.setUserId(4L);
        healthBreakthrough.setTags(Set.of("health", "science", "biotech"));
        healthBreakthrough.setCreatedAt(LocalDateTime.now().minusHours(16));
        healthBreakthrough.setVoteCount(31);
        healthBreakthrough.setCommentCount(9);

        Summary marketWatch = new Summary();
        marketWatch.setTitle("Clean Tech Startups See Record Funding in Q3");
        marketWatch.setContent("""
                Venture capital investment in clean technology startups hit a record $24B in Q3, with strong interest in energy storage, carbon capture, and grid modernization. Analysts attribute the surge to supportive regulation and new corporate sustainability mandates.
                """.trim());
        marketWatch.setOriginalUrl("https://example.com/articles/cleantech-funding-q3");
        marketWatch.setUserId(5L);
        marketWatch.setTags(Set.of("business", "sustainability", "startups"));
        marketWatch.setCreatedAt(LocalDateTime.now().minusHours(10));
        marketWatch.setVoteCount(19);
        marketWatch.setCommentCount(4);

        summaryRepository.saveAll(List.of(
                aiBreakthrough,
                climateDigest,
                spaceUpdate,
                healthBreakthrough,
                marketWatch
        ));
    }
}

