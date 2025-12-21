package com.tldr.circle.config;

import com.tldr.circle.model.Circle;
import com.tldr.circle.repository.CircleRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SampleDataLoader {
    
    private final CircleRepository circleRepository;
    
    @PostConstruct
    public void loadSampleData() {
        if (circleRepository.count() > 0) {
            log.info("Circles already exist, skipping sample data load");
            return;
        }
        
        // Global circle
        Circle global = new Circle();
        global.setName("Global");
        global.setType(Circle.CircleType.GLOBAL);
        global.setDescription("Global discussions and news from around the world");
        global.setFollowerCount(1000);
        global.setPostCount(500);
        circleRepository.save(global);
        
        // Country circles
        String[] countries = {
            "United States", "United Kingdom", "Canada", "Australia", 
            "India", "Germany", "France", "Japan", "Brazil", "Mexico"
        };
        
        String[] countryCodes = {
            "US", "GB", "CA", "AU", "IN", "DE", "FR", "JP", "BR", "MX"
        };
        
        for (int i = 0; i < countries.length; i++) {
            Circle country = new Circle();
            country.setName(countries[i]);
            country.setType(Circle.CircleType.COUNTRY);
            country.setCountryCode(countryCodes[i]);
            country.setDescription("News and discussions from " + countries[i]);
            country.setFollowerCount(100 + (i * 10));
            country.setPostCount(50 + (i * 5));
            circleRepository.save(country);
        }
        
        // Sample local circles
        String[] localCircles = {
            "Tech Valley", "Startup Hub", "Science Corner", "Business Insights"
        };
        
        for (String localName : localCircles) {
            Circle local = new Circle();
            local.setName(localName);
            local.setType(Circle.CircleType.LOCAL);
            local.setDescription("Community-driven discussions about " + localName);
            local.setCreatorId(1L); // Assuming user 1 exists
            local.setFollowerCount(50);
            local.setPostCount(20);
            circleRepository.save(local);
        }
        
        log.info("Loaded {} sample circles", circleRepository.count());
    }
}

