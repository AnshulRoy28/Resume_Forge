# Library Item Types

ResumeForge now supports multiple types of library items beyond just projects.

## Supported Types

### 1. **Project** 
- GitHub repositories and personal projects
- Technical implementations and side projects
- **Fields**: Title, Tags, Content, Source URL

### 2. **Work Experience**
- Professional work history
- Job roles and responsibilities
- **Fields**: Title (Position), Organization (Company), Location, Start Date, End Date, Tags, Content

### 3. **Education**
- Academic degrees and coursework
- Educational institutions
- **Fields**: Title (Degree), Organization (Institution), Location, Start Date, End Date, Tags, Content

### 4. **Skills**
- Technical skills and proficiencies
- Programming languages, frameworks, tools
- **Fields**: Title, Tags, Content

### 5. **Certification**
- Professional certifications and licenses
- Industry credentials
- **Fields**: Title, Organization (Issuer), Start Date (Date Obtained), Tags, Content

## UI Features

### Visual Indicators
Each item type has a unique:
- **Icon**: Visual identifier in the library grid
- **Color Badge**: Color-coded type label
  - Project: Purple
  - Experience: Blue
  - Education: Green
  - Skills: Yellow
  - Certification: Orange

### Dynamic Forms
The Add/Edit modals show different fields based on the selected type:
- **Experience/Education**: Shows Company/Institution, Location, Start/End dates
- **Certification**: Shows Issuing Organization, Date Obtained
- **Project/Skills**: Shows basic fields only

### Filtering
Users can filter library items by:
- Search text (searches title, tags, content)
- Tag selection
- Item type

## Resume Generation

The AI resume generator now:
1. Recognizes different item types in the library
2. Organizes content into appropriate resume sections
3. Formats each type according to resume best practices
4. Prioritizes relevant content based on job description

## Database Schema

The `library` table includes:
- `item_type`: Type of item (project, experience, education, skill, certification)
- `organization`: Company, institution, or issuing organization
- `location`: Geographic location
- `start_date`: Start date or date obtained
- `end_date`: End date (for experience/education)

## Example Usage

### Adding Work Experience
1. Click "Add Manually"
2. Select "Work Experience" type
3. Fill in: Position title, Company, Location, Dates
4. Add bullet points in markdown content
5. Tag with relevant technologies

### Adding Education
1. Click "Add Manually"
2. Select "Education" type
3. Fill in: Degree, Institution, Location, Dates
4. Add coursework, achievements in content
5. Tag with relevant subjects/skills

### Adding Certification
1. Click "Add Manually"
2. Select "Certification" type
3. Fill in: Certification name, Issuing org, Date
4. Add details in content
5. Tag with relevant technologies
