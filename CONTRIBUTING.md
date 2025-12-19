# Contributing to TLDR

Thank you for your interest in contributing to TLDR! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/TLDR.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes thoroughly
6. Commit your changes: `git commit -am 'Add some feature'`
7. Push to the branch: `git push origin feature/your-feature-name`
8. Submit a pull request

## Development Setup

Follow the [Quick Start Guide](QUICKSTART.md) to set up your development environment.

## Code Style

### Java (Backend)
- Follow standard Java naming conventions
- Use meaningful variable and method names
- Add comments for complex logic
- Keep methods small and focused
- Use Lombok annotations to reduce boilerplate

Example:
```java
@Service
public class SummaryService {
    
    @Autowired
    private SummaryRepository summaryRepository;
    
    /**
     * Creates a new news summary
     * @param summary The summary to create
     * @return The created summary DTO
     */
    public SummaryDTO createSummary(Summary summary) {
        Summary savedSummary = summaryRepository.save(summary);
        return convertToDTO(savedSummary);
    }
}
```

### JavaScript/React (Frontend)
- Use functional components with hooks
- Follow React best practices
- Use meaningful component and variable names
- Keep components small and reusable
- Use ES6+ features

Example:
```javascript
function SummaryCard({ summary }) {
  const [voteCount, setVoteCount] = useState(summary.voteCount || 0);
  
  const handleVote = async (value) => {
    // Implementation
  };
  
  return (
    <div className="summary-card">
      {/* Component JSX */}
    </div>
  );
}
```

## Project Structure

```
backend/
  [service-name]/
    src/main/java/com/tldr/[service]/
      model/          # JPA entities
      repository/     # Spring Data repositories
      service/        # Business logic
      controller/     # REST controllers
      dto/           # Data Transfer Objects
    src/main/resources/
      application.properties

frontend/
  src/
    components/     # Reusable React components
    pages/         # Page components (HomePage, ForYouPage, NotificationsPage, etc.)
    services/      # API service layer
    context/       # React contexts (AuthContext)
    hooks/         # Custom React hooks
```

## Adding a New Feature

### Backend Feature

1. **Create/Update Model**
   ```java
   @Entity
   @Table(name = "your_table")
   public class YourEntity {
       @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       private Long id;
       // Add fields
   }
   ```

2. **Create Repository**
   ```java
   @Repository
   public interface YourRepository extends JpaRepository<YourEntity, Long> {
       // Add custom queries
   }
   ```

3. **Create Service**
   ```java
   @Service
   public class YourService {
       @Autowired
       private YourRepository repository;
       // Add business logic
   }
   ```

4. **Create Controller**
   ```java
   @RestController
   @RequestMapping("/api/your-endpoint")
   @CrossOrigin(origins = "*")
   public class YourController {
       @Autowired
       private YourService service;
       // Add endpoints
   }
   ```

### Frontend Feature

1. **Create Component** in `src/components/`
2. **Add API Service** in `src/services/api.js`
3. **Create/Update Page** in `src/pages/`
4. **Update Routing** in `src/App.js` if needed

## Testing

### Backend Tests
```java
@SpringBootTest
class YourServiceTest {
    @Autowired
    private YourService service;
    
    @Test
    void testYourFeature() {
        // Test implementation
    }
}
```

Run tests:
```bash
mvn test
```

### Frontend Tests
```javascript
import { render, screen } from '@testing-library/react';
import YourComponent from './YourComponent';

test('renders component', () => {
  render(<YourComponent />);
  // Assertions
});
```

Run tests:
```bash
npm test
```

## Database Changes

When modifying entities:
1. Update the model class
2. Spring JPA will auto-update the schema (ddl-auto=update)
3. For production, use migrations (Flyway/Liquibase)

## API Changes

When adding/modifying endpoints:
1. Follow RESTful conventions
2. Use appropriate HTTP methods (GET, POST, PUT, DELETE)
3. Return proper HTTP status codes
4. Document in README.md API section

## Common Contribution Areas

### Easy (Good for Beginners)
- Add validation to forms
- Improve error messages
- Add loading states
- Enhance UI/UX
- Fix typos in documentation
- Add code comments
- Improve notification styling
- Add badge icons

### Medium
- Add new API endpoints
- Create new React components
- Implement advanced search functionality
- Add pagination improvements
- Improve error handling
- Enhance recommendation algorithm
- Add more notification types

### Advanced
- Add authentication/authorization enhancements
- Implement caching
- Add rate limiting
- Service discovery
- Performance optimization
- Add monitoring/logging
- Machine learning for recommendations
- Real-time updates with WebSocket

## Pull Request Guidelines

1. **Title**: Clear and descriptive (e.g., "Add user profile page")
2. **Description**: Explain what and why
   - What does this PR do?
   - Why is this change needed?
   - How does it work?
   - Screenshots for UI changes
3. **Testing**: Describe how you tested
4. **Breaking Changes**: Clearly note any breaking changes
5. **Size**: Keep PRs focused and reasonably sized

## Code Review Process

1. Submit PR
2. Automated checks run (if configured)
3. Maintainer reviews code
4. Address feedback
5. PR is merged

## Reporting Bugs

Use GitHub Issues with:
- Clear title
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Java version, etc.)
- Screenshots if applicable

## Feature Requests

Use GitHub Issues with:
- Clear description of the feature
- Use case / why it's needed
- Proposed implementation (optional)

## Questions?

- Open a GitHub Discussion
- Create an Issue
- Check existing documentation

## License

By contributing, you agree that your contributions will be licensed under the project's license.

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Git commit history

Thank you for contributing to TLDR! 🎉
