package backend.exception;

public class AchievementsNotFoundException extends RuntimeException{
    public AchievementsNotFoundException(String id){
        super("Could not found with id"+id);
    }
}
