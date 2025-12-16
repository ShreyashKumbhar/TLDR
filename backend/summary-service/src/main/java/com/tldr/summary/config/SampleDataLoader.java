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

        // PLATINUM user (elitecontributor - userId 6) posts - Technology/AI focused
        Summary aiFramework = new Summary();
        aiFramework.setTitle("New Open-Source AI Framework Simplifies Model Training");
        aiFramework.setContent("""
                Researchers released an open-source framework that reduces AI model training time by 40% while maintaining accuracy. The tool automates hyperparameter tuning and supports distributed training across cloud platforms, making advanced AI accessible to smaller teams.
                """.trim());
        aiFramework.setOriginalUrl("https://example.com/articles/ai-framework-opensource");
        aiFramework.setUserId(6L);
        aiFramework.setTags(Set.of("technology", "ai", "programming", "open-source"));
        aiFramework.setCreatedAt(LocalDateTime.now().minusHours(2));
        aiFramework.setVoteCount(156);
        aiFramework.setCommentCount(34);

        Summary quantumComputing = new Summary();
        quantumComputing.setTitle("Quantum Computer Achieves Error Correction Milestone");
        quantumComputing.setContent("""
                A quantum computing team demonstrated error correction that maintains qubit coherence for over 10 seconds, a 100x improvement. This breakthrough brings practical quantum computing applications closer to reality, with implications for cryptography and drug discovery.
                """.trim());
        quantumComputing.setOriginalUrl("https://example.com/articles/quantum-error-correction");
        quantumComputing.setUserId(6L);
        quantumComputing.setTags(Set.of("technology", "science", "quantum", "research"));
        quantumComputing.setCreatedAt(LocalDateTime.now().minusHours(5));
        quantumComputing.setVoteCount(142);
        quantumComputing.setCommentCount(28);

        Summary blockchainUpdate = new Summary();
        blockchainUpdate.setTitle("Blockchain Protocol Reduces Energy Consumption by 99%");
        blockchainUpdate.setContent("""
                A new consensus mechanism eliminates the need for energy-intensive mining while maintaining security. Early tests show the protocol can process 10,000 transactions per second with minimal environmental impact, addressing major sustainability concerns.
                """.trim());
        blockchainUpdate.setOriginalUrl("https://example.com/articles/blockchain-energy-efficient");
        blockchainUpdate.setUserId(6L);
        blockchainUpdate.setTags(Set.of("technology", "blockchain", "sustainability", "innovation"));
        blockchainUpdate.setCreatedAt(LocalDateTime.now().minusHours(8));
        blockchainUpdate.setVoteCount(128);
        blockchainUpdate.setCommentCount(22);

        Summary cybersecurity = new Summary();
        cybersecurity.setTitle("AI-Powered Security System Detects Zero-Day Attacks in Real-Time");
        cybersecurity.setContent("""
                A new AI security platform successfully identified and neutralized three zero-day vulnerabilities before they could be exploited. The system uses behavioral analysis and machine learning to detect anomalies, representing a shift toward proactive cybersecurity.
                """.trim());
        cybersecurity.setOriginalUrl("https://example.com/articles/ai-cybersecurity-zeroday");
        cybersecurity.setUserId(6L);
        cybersecurity.setTags(Set.of("technology", "security", "ai", "cybersecurity"));
        cybersecurity.setCreatedAt(LocalDateTime.now().minusDays(1));
        cybersecurity.setVoteCount(134);
        cybersecurity.setCommentCount(31);

        Summary robotics = new Summary();
        robotics.setTitle("Humanoid Robots Begin Commercial Deployment in Warehouses");
        robotics.setContent("""
                A robotics company deployed 500 humanoid robots across distribution centers, handling complex tasks previously requiring human workers. The robots demonstrate advanced dexterity and decision-making, marking a significant step toward general-purpose automation.
                """.trim());
        robotics.setOriginalUrl("https://example.com/articles/humanoid-robots-warehouse");
        robotics.setUserId(6L);
        robotics.setTags(Set.of("technology", "robotics", "automation", "innovation"));
        robotics.setCreatedAt(LocalDateTime.now().minusDays(2));
        robotics.setVoteCount(119);
        robotics.setCommentCount(19);

        // More posts from other users for recommendation testing
        Summary aiEthics = new Summary();
        aiEthics.setTitle("Global AI Ethics Framework Gains Support from 50+ Countries");
        aiEthics.setContent("""
                An international coalition adopted a comprehensive AI ethics framework addressing bias, transparency, and accountability. The agreement includes enforcement mechanisms and regular review processes, setting a precedent for responsible AI development worldwide.
                """.trim());
        aiEthics.setOriginalUrl("https://example.com/articles/ai-ethics-framework");
        aiEthics.setUserId(1L);
        aiEthics.setTags(Set.of("technology", "ai", "ethics", "policy"));
        aiEthics.setCreatedAt(LocalDateTime.now().minusHours(4));
        aiEthics.setVoteCount(87);
        aiEthics.setCommentCount(15);

        Summary climateTech = new Summary();
        climateTech.setTitle("Direct Air Capture Technology Reaches Cost Parity with Carbon Credits");
        climateTech.setContent("""
                A breakthrough in direct air capture technology reduced costs to $50 per ton of CO2, matching current carbon credit prices. The innovation uses renewable energy and novel sorbent materials, making large-scale carbon removal economically viable for the first time.
                """.trim());
        climateTech.setOriginalUrl("https://example.com/articles/dac-cost-parity");
        climateTech.setUserId(2L);
        climateTech.setTags(Set.of("climate", "technology", "sustainability", "innovation"));
        climateTech.setCreatedAt(LocalDateTime.now().minusHours(7));
        climateTech.setVoteCount(73);
        climateTech.setCommentCount(12);

        Summary biotech = new Summary();
        biotech.setTitle("Gene Therapy Shows Promise for Treating Rare Genetic Disorders");
        biotech.setContent("""
                Clinical trials of a new gene therapy approach demonstrated 90% success rate in treating previously incurable genetic conditions. The treatment uses CRISPR-based techniques to correct mutations at the source, offering hope to thousands of patients worldwide.
                """.trim());
        biotech.setOriginalUrl("https://example.com/articles/gene-therapy-crispr");
        biotech.setUserId(4L);
        biotech.setTags(Set.of("health", "science", "biotech", "genetics"));
        biotech.setCreatedAt(LocalDateTime.now().minusHours(12));
        biotech.setVoteCount(65);
        biotech.setCommentCount(11);

        Summary spaceTech = new Summary();
        spaceTech.setTitle("Mars Sample Return Mission Enters Final Planning Phase");
        spaceTech.setContent("""
                International space agencies finalized plans for the most complex robotic mission ever attempted: returning samples from Mars. The multi-stage mission will launch in 2028, with samples expected to reach Earth by 2033, providing unprecedented insights into Martian geology and potential life.
                """.trim());
        spaceTech.setOriginalUrl("https://example.com/articles/mars-sample-return");
        spaceTech.setUserId(3L);
        spaceTech.setTags(Set.of("space", "science", "mars", "exploration"));
        spaceTech.setCreatedAt(LocalDateTime.now().minusDays(1).minusHours(5));
        spaceTech.setVoteCount(91);
        spaceTech.setCommentCount(18);

        Summary fintech = new Summary();
        fintech.setTitle("Central Bank Digital Currency Pilot Expands to 20 Countries");
        fintech.setContent("""
                A coordinated CBDC pilot program launched across 20 countries, testing cross-border payments and financial inclusion applications. Early results show 50% reduction in transaction costs and near-instant settlement times, potentially revolutionizing international finance.
                """.trim());
        fintech.setOriginalUrl("https://example.com/articles/cbdc-pilot-expansion");
        fintech.setUserId(5L);
        fintech.setTags(Set.of("business", "finance", "technology", "policy"));
        fintech.setCreatedAt(LocalDateTime.now().minusHours(15));
        fintech.setVoteCount(58);
        fintech.setCommentCount(9);

        Summary aiEducation = new Summary();
        aiEducation.setTitle("AI Tutoring System Personalizes Learning for 1 Million Students");
        aiEducation.setContent("""
                An AI-powered education platform successfully personalized learning paths for over 1 million students across 50 countries. The system adapts in real-time to each student's learning style, resulting in 30% improvement in test scores and higher engagement rates.
                """.trim());
        aiEducation.setOriginalUrl("https://example.com/articles/ai-education-tutoring");
        aiEducation.setUserId(6L);
        aiEducation.setTags(Set.of("technology", "ai", "education", "innovation"));
        aiEducation.setCreatedAt(LocalDateTime.now().minusDays(3));
        aiEducation.setVoteCount(167);
        aiEducation.setCommentCount(42);

        Summary autonomousVehicles = new Summary();
        autonomousVehicles.setTitle("Fully Autonomous Vehicles Approved for Public Roads in Three Cities");
        autonomousVehicles.setContent("""
                Regulatory approval granted for Level 5 autonomous vehicles to operate without human drivers in designated urban areas. The vehicles completed 10 million miles of testing with zero accidents, marking a major milestone toward widespread adoption.
                """.trim());
        autonomousVehicles.setOriginalUrl("https://example.com/articles/autonomous-vehicles-approved");
        autonomousVehicles.setUserId(6L);
        autonomousVehicles.setTags(Set.of("technology", "automation", "transportation", "innovation"));
        autonomousVehicles.setCreatedAt(LocalDateTime.now().minusDays(4));
        autonomousVehicles.setVoteCount(153);
        autonomousVehicles.setCommentCount(37);

        summaryRepository.saveAll(List.of(
                aiBreakthrough,
                climateDigest,
                spaceUpdate,
                healthBreakthrough,
                marketWatch,
                aiFramework,
                quantumComputing,
                blockchainUpdate,
                cybersecurity,
                robotics,
                aiEthics,
                climateTech,
                biotech,
                spaceTech,
                fintech,
                aiEducation,
                autonomousVehicles
        ));
    }
}

