package backend.exception;

public class LearningPlanNotFoundException extends RuntimeException{
    public LearningPlanNotFoundException(String id){
        super("Could not found with id"+id);
    }
}
