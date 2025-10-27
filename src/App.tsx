import { GitHubAutocomplete } from "@/components/GitHubAutocomplete";

const App = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-background px-4">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            GitHub Repository & User Search
          </h1>
          <p className="text-muted-foreground">
            Search for GitHub repositories and users in real-time with keyboard
            navigation support
          </p>
        </div>

        {/* GitHubAutocomplete Component */}
        <div className="flex justify-center">
          <GitHubAutocomplete
            onSelect={(result) => {
              console.log("Selected:", result);
            }}
          />
        </div>

        {/* Features list */}
        <div className="text-sm text-muted-foreground space-y-1 text-center">
          <p>💡 Type at least 3 characters to search</p>
          <p>⌨️ Use arrow keys to navigate, Enter to select, Escape to close</p>
          <p>♿ Fully accessible with screen reader support</p>
        </div>
      </div>
    </div>
  );
};

export default App;
